import { useAppSelector } from '@/store/store';
import { ChangeEvent, FormEvent, useState } from 'react';
import { v4 as uuid } from 'uuid';
import toast from 'react-hot-toast';
import { Trash2Icon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  compareObjectProperties,
  composition,
  deepCloneTrimmed,
  isAnyNestedPropertyOfObjectEmpty,
  removeIdAndGiveRest,
  removeSpecialChars,
  replaceSpaceWithUnderScores,
} from '@/utils/utils';

import {
  useCreateCallTemplateMutation,
  useUpdateCallTemplateMutation,
} from '@/queries/callTemplateActions';
import {
  CallTemplateType,
  PromptVariableType,
  SingleResultTemplatesType,
} from '@/types/callTemplate';

type CallTemplateFormProps = {
  isEditingTemplateAndData: CallTemplateType;
};

const CONSTANT_RESULT_TYPES = ['yes / no', 'text'];

const defaultQuestion = {
  question: '',
  columnName: '',
  resultType: '',
};

const defaultPromptVariable = {
  key: '',
  defaultValue: '',
};

const CallTemplateForm = ({
  isEditingTemplateAndData,
}: CallTemplateFormProps) => {
  const { token, userInfo } = useAppSelector((store) => store.auth);
  const { mutate: createTemplateFunc, isLoading: isCreatingTemplate } =
    useCreateCallTemplateMutation(token);

  const { mutate: updateTemplateFunc, isLoading: isUpdatingTemplate } =
    useUpdateCallTemplateMutation(isEditingTemplateAndData?._id, token);

  const isFormSubmitting = isCreatingTemplate || isUpdatingTemplate;

  const initialInputsState = isEditingTemplateAndData
    ? {
        voice: isEditingTemplateAndData.voiceId,
        callTemplateName: isEditingTemplateAndData.callTemplateName,
        promptContextText: isEditingTemplateAndData.promptContextText,
        promptObjectiveText: isEditingTemplateAndData.promptObjectiveText,
        nameOfAI: isEditingTemplateAndData.nameOfAI,
      }
    : {
        voice: '',
        callTemplateName: '',
        promptContextText: '',
        promptObjectiveText: '',
        nameOfAI: '',
      };

  const initialListOfPromptVariables =
    isEditingTemplateAndData &&
    isEditingTemplateAndData.promptVariables.length >= 1
      ? isEditingTemplateAndData.promptVariables
      : [{ ...defaultPromptVariable, _id: uuid() }];

  const [inputs, setInputs] = useState(initialInputsState);

  const [listOfPromptVariables, setListOfPromptVariables] = useState<
    PromptVariableType[]
  >(initialListOfPromptVariables);

  const [resultTemplates, setResultTemplates] = useState<
    SingleResultTemplatesType[]
  >(
    isEditingTemplateAndData &&
      isEditingTemplateAndData.resultTemplates.length >= 1
      ? isEditingTemplateAndData.resultTemplates
      : [{ ...defaultQuestion, _id: uuid() }]
  );

  const allFormInputs = {
    ...inputs,
    promptVariables: listOfPromptVariables,
    resultTemplates,
  };

  const handleInputChange = ({
    target: { name, value },
  }: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setInputs((prev) => ({ ...prev, [name]: value }));

  const handlePromptVariableChange = (
    { target: { name, value } }: ChangeEvent<HTMLInputElement>,
    idOfPromptVariableToChange: string
  ) => {
    const valueToDisplay =
      name === 'key'
        ? composition<string>(
            removeSpecialChars,
            replaceSpaceWithUnderScores
          )(value)
        : value;

    const updatedList = listOfPromptVariables.map((singlePromptVariable) => {
      if (singlePromptVariable._id === idOfPromptVariableToChange) {
        return {
          ...singlePromptVariable,
          [name]: valueToDisplay,
        };
      } else {
        return singlePromptVariable;
      }
    });

    setListOfPromptVariables(updatedList);
  };

  const handleQuestionInputChange = (
    name: string,
    value: string,
    questionIdToChange: string
  ) => {
    const updatedResultTemplates = resultTemplates.map((singleQuestion) => {
      if (singleQuestion._id === questionIdToChange) {
        const valueToDisplay =
          name !== 'columnName' ? value : removeSpecialChars(value.trim());

        return {
          ...singleQuestion,
          [name]: valueToDisplay,
        };
      } else {
        return singleQuestion;
      }
    });

    setResultTemplates(updatedResultTemplates);
  };

  const removePromptVariable = (idOfPromptVariableToRemove: string) => {
    const listAfterRemoval = listOfPromptVariables.filter(
      ({ _id }) => _id !== idOfPromptVariableToRemove
    );

    setListOfPromptVariables(listAfterRemoval);
  };

  const addPromptVariable = () => {
    const newPromptVariable = { ...defaultPromptVariable, _id: uuid() };

    // if no promptVariable in the list, add one default
    if (listOfPromptVariables.length < 1) {
      setListOfPromptVariables([newPromptVariable]);
      return;
    }

    // if all inputs of prevous prompt Var in list is empty, dont add a new promptVariable.
    // rest operator used here
    const { _id, ...lastPromptVariable } =
      listOfPromptVariables[listOfPromptVariables.length - 1];
    const isLastPromptVariableAllInputEmpty = Object.values(
      lastPromptVariable
    ).every((inputValue) => !inputValue);

    if (isLastPromptVariableAllInputEmpty) {
      return;
    }

    // if any input of previous promptVariable is filled, a new prompt variable can be added
    setListOfPromptVariables((prev) => [...prev, newPromptVariable]);
  };

  const addQuestion = () => {
    const newQuestion = { ...defaultQuestion, _id: uuid() };

    // if no questions in result Template
    if (resultTemplates.length < 1) {
      setResultTemplates([newQuestion]);
      return;
    }

    // if all inputs of prevous question in result Template is empty, dont add a new Question.
    // rest operator used here
    const { _id, ...lastQuestion } =
      resultTemplates[resultTemplates.length - 1];
    const isLastQuestionAllInputEmpty = Object.values(lastQuestion).every(
      (inputValue) => !inputValue
    );

    if (isLastQuestionAllInputEmpty) {
      return;
    }

    // if any input of previous question is filled adding a new Question can be done.
    setResultTemplates((prev) => [...prev, newQuestion]);
  };

  const removeQuestion = (questionIdToRemove: string) => {
    const questionListAfterRemoval = resultTemplates.filter(
      ({ _id }) => _id !== questionIdToRemove
    );

    setResultTemplates(questionListAfterRemoval);
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const trimmedInputsClone = deepCloneTrimmed(allFormInputs);
    const isAnyInputEmptyAndMessage =
      isAnyNestedPropertyOfObjectEmpty(trimmedInputsClone);

    if (isAnyInputEmptyAndMessage) {
      // hardcoded

      //  next line, this is when any prompt variable name input is Empty
      const message =
        (isAnyInputEmptyAndMessage as string) === 'Key'
          ? 'Variable Name'
          : isAnyInputEmptyAndMessage;

      toast.error(`Please fill the ${message}`);
      return;
    }

    if (
      isEditingTemplateAndData &&
      compareObjectProperties(isEditingTemplateAndData, trimmedInputsClone)
    ) {
      toast.error('No changes found to update..');
      return;
    }

    const templateData = {
      teamId: userInfo?.teamIds[0],
      ...trimmedInputsClone,
      voiceId: trimmedInputsClone.voice,
      status: 'paused',
      promptVariables:
        trimmedInputsClone.promptVariables.map(removeIdAndGiveRest),
      resultTemplates:
        trimmedInputsClone.resultTemplates.map(removeIdAndGiveRest),
    };

    isEditingTemplateAndData
      ? updateTemplateFunc(templateData)
      : createTemplateFunc(templateData);
  };

  return (
    <form
      onSubmit={handleFormSubmit}
      className='pt-8 pb-12 w-[95vw] mx-auto md:mx-0 md:px-8 md:w-full flex flex-col gap-3'
    >
      <header className='mb-8'>
        <h2 className='text-gray-900 text-2xl font-medium'>
          {isEditingTemplateAndData ? 'Update' : 'Create'} Call Template
        </h2>
      </header>

      <main className='w-full md:max-w-md'>
        {/* the above form contains two dash separated divs*/}
        <div className='flex flex-col gap-4 pb-7'>
          {/* the above div contains column wise (label+input) */}
          <div className='flex md:flex-col gap-3 justify-between'>
            {/* the above div contains voice and call template name */}
            <div className='flex flex-col gap-[6px] w-full'>
              <Label
                className='w-fit text-gray-700 text-sm font-medium'
                htmlFor='voice'
              >
                Voice
              </Label>
              <Input
                name='voice'
                type='text'
                id='voice'
                value={inputs.voice}
                onChange={handleInputChange}
                placeholder='Enter Voice'
                // isInvalid={!!errorMsg.voice}
                autoComplete='off'
                disabled={isFormSubmitting}
              />
              {/* {!!errorMsg.firstName && (
          <p className='text-sm text-error-500'>{errorMsg.firstName}</p>
        )} */}
            </div>

            <div className='flex flex-col gap-[6px] w-full'>
              <Label
                className='w-fit text-gray-700 text-sm font-medium'
                htmlFor='callTemplateName'
              >
                Name
              </Label>
              <Input
                name='callTemplateName'
                type='text'
                id='callTemplateName'
                value={inputs.callTemplateName}
                onChange={handleInputChange}
                placeholder='Enter Call Template Name'
                // isInvalid={!!errorMsg.callTemplateName}
                autoComplete='off'
                disabled={isFormSubmitting}
              />
              {/* {!!errorMsg.lastName && (
          <p className='text-sm text-error-500'>{errorMsg.lastName}</p>
        )} */}
            </div>
          </div>

          <div className='flex flex-col gap-[6px] w-full'>
            <Label
              className='w-fit text-gray-700 text-sm font-medium'
              htmlFor='nameOfAI'
            >
              Name of AI
            </Label>
            <Input
              name='nameOfAI'
              type='text'
              id='nameOfAI'
              value={inputs.nameOfAI}
              onChange={handleInputChange}
              placeholder='Enter Name of AI'
              // isInvalid={!!errorMsg.nameOfAI}
              autoComplete='off'
              disabled={isFormSubmitting}
            />
            {/* {!!errorMsg.firstName && (
          <p className='text-sm text-error-500'>{errorMsg.firstName}</p>
        )} */}
          </div>

          <div className='flex flex-col gap-[6px]'>
            <Label
              className='w-fit text-gray-700 text-sm font-medium'
              htmlFor='promptContextText'
            >
              Context
            </Label>
            <Textarea
              name='promptContextText'
              id='promptContextText'
              value={inputs.promptContextText}
              onChange={handleInputChange}
              placeholder='Enter Context'
              // isInvalid={!!errorMsg.callTemplateName}
              autoComplete='off'
              disabled={isFormSubmitting}
            />
            {/* {!!errorMsg.lastName && (
          <p className='text-sm text-error-500'>{errorMsg.lastName}</p>
        )} */}
          </div>

          <div className='flex flex-col gap-[6px]'>
            <Label
              className='w-fit text-gray-700 text-sm font-medium'
              htmlFor='promptObjectiveText'
            >
              Prompt Objective Text
            </Label>
            <Textarea
              name='promptObjectiveText'
              id='promptObjectiveText'
              value={inputs.promptObjectiveText}
              onChange={handleInputChange}
              placeholder='Enter Prompt Objective Text'
              // isInvalid={!!errorMsg.callTemplateName}
              autoComplete='off'
              disabled={isFormSubmitting}
            />
          </div>

          {listOfPromptVariables.length >= 1 ? (
            <div className='flex flex-col gap-3'>
              <Label
                className='w-fit text-gray-700 text-sm font-medium'
                htmlFor='promptVariable'
              >
                Prompt Variables
              </Label>

              <div>
                <table className='border-none'>
                  <thead className='w-full bg-white'>
                    <tr className='text-left text-sm'>
                      <th className='pb-1 font-normal'>Variable Name</th>
                      <th className='pb-1 font-normal'>Default Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listOfPromptVariables.map(({ _id, key, defaultValue }) => (
                      <tr key={_id}>
                        <td className='p-2 pl-0'>
                          <Input
                            name='key'
                            type='text'
                            placeholder='Enter Prompt Variable'
                            autoComplete='off'
                            disabled={isFormSubmitting}
                            value={key}
                            onChange={(e) => handlePromptVariableChange(e, _id)}
                          />
                        </td>
                        <td className='p-2 pl-0'>
                          <Input
                            name='defaultValue'
                            type='text'
                            placeholder='Enter Default Value'
                            autoComplete='off'
                            disabled={isFormSubmitting}
                            value={defaultValue}
                            onChange={(e) => handlePromptVariableChange(e, _id)}
                          />
                        </td>
                        <td>
                          <Button
                            type='button'
                            className='px-2'
                            size='sm'
                            variant='secondary'
                            disabled={isFormSubmitting}
                            onClick={() => removePromptVariable(_id)}
                          >
                            <Trash2Icon />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Button
                type='button'
                variant='secondary'
                size='sm'
                className='w-fit inline-block ml-auto'
                onClick={addPromptVariable}
                disabled={isFormSubmitting}
              >
                Add Prompt Variable
              </Button>
            </div>
          ) : (
            <Button
              className='w-fit inline-block mr-auto'
              type='button'
              variant='secondary'
              size='sm'
              disabled={isFormSubmitting}
              onClick={addPromptVariable}
            >
              Create Prompt Variables
            </Button>
          )}
        </div>

        {/* the other side- result template */}

        {resultTemplates.length >= 1 ? (
          <div className='flex flex-col gap-2 border-dashed border-t-2 border-primary-500 pt-8'>
            <Label
              className='w-fit text-gray-700 text-sm font-medium'
              htmlFor='resultTemplates'
            >
              Result Template
            </Label>

            <div>
              <table className='relative border-none'>
                <thead className='sticky top-0 w-full bg-white'>
                  <tr className='text-left text-sm'>
                    <th className='pb-1 font-normal'>Question</th>
                    <th className='pb-1 font-normal'>Column Name</th>
                    <th className='pb-1 font-normal'>Result Type</th>
                  </tr>
                </thead>
                <tbody>
                  {resultTemplates.map(
                    ({ _id: questionId, question, columnName, resultType }) => (
                      <tr key={questionId}>
                        <td className='p-2 pl-0'>
                          <Input
                            name='question'
                            type='text'
                            placeholder='Enter Question'
                            autoComplete='off'
                            value={question}
                            disabled={isFormSubmitting}
                            onChange={({ target: { name, value } }) =>
                              handleQuestionInputChange(name, value, questionId)
                            }
                          />
                        </td>
                        <td className='p-2 pl-0'>
                          <Input
                            name='columnName'
                            type='text'
                            placeholder='Enter Column Name'
                            className='max-w-[9rem]'
                            autoComplete='off'
                            disabled={isFormSubmitting}
                            value={columnName}
                            onChange={({ target: { name, value } }) =>
                              handleQuestionInputChange(name, value, questionId)
                            }
                          />
                        </td>
                        <td className='p-2 pl-0 flex'>
                          <Select
                            name='resultType'
                            value={resultType}
                            onValueChange={(value) =>
                              handleQuestionInputChange(
                                'resultType',
                                value,
                                questionId
                              )
                            }
                          >
                            <SelectTrigger className='w-[7em] capitalize'>
                              <SelectValue
                                placeholder='Select'
                                defaultValue={resultType}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {CONSTANT_RESULT_TYPES.map(
                                  (singleType, index) => (
                                    <SelectItem
                                      className='capitalize'
                                      key={index}
                                      value={singleType}
                                    >
                                      {singleType}
                                    </SelectItem>
                                  )
                                )}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <Button
                            type='button'
                            className='px-2'
                            size='sm'
                            variant='secondary'
                            disabled={isFormSubmitting}
                            onClick={() => removeQuestion(questionId)}
                          >
                            <Trash2Icon />
                          </Button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            <Button
              onClick={addQuestion}
              disabled={isFormSubmitting}
              className='w-fit inline-block ml-auto'
              type='button'
              variant='secondary'
              size='sm'
            >
              Add Question
            </Button>
          </div>
        ) : (
          <Button
            type='button'
            size='sm'
            variant='secondary'
            className='w-fit inline-block mr-auto'
            disabled={isFormSubmitting}
            onClick={addQuestion}
          >
            Add Result Template
          </Button>
        )}
      </main>

      <footer className='flex justify-center items-center max-w-md'>
        <Button size='lg' type='submit' disabled={isFormSubmitting}>
          {isEditingTemplateAndData ? 'Update' : 'Create'} Call Template
        </Button>
      </footer>
    </form>
  );
};

export default CallTemplateForm;
