import { useSearchParams } from 'react-router-dom';
import { useAppSelector } from '@/store/store';
import { useGetCallTemplateQuery } from '@/queries/callTemplateQueries';
import CallTemplateForm from '@/components/dashboard/callTemplateForm';

const CallTemplateFormPage = () => {
  const token = useAppSelector((store) => store.auth.token);
  const userInfo = useAppSelector((store) => store.auth.userInfo);
  const [searchParam] = useSearchParams();
  const isEditingAndCallTemplateId = searchParam.get('callTemplateId');

  // if in query params there is "callTemplateId", it means the page is getting editted.

  const responseCallTemplate = useGetCallTemplateQuery({
    token,
    teamId: userInfo?.teamIds[0],
    callTemplateId: isEditingAndCallTemplateId,
  });

  if (userInfo?.teamIds.length < 1) {
    return <p>To Create a Call template you have to join a team!</p>;
  }

  if (responseCallTemplate?.isError) {
    return <p>Something went wrong...</p>;
  }

  if (responseCallTemplate?.isLoading && isEditingAndCallTemplateId) {
    return <p>Loading...</p>;
  }

  // isAddingTemplate OR isEditingTemplate
  return (
    <CallTemplateForm isEditingTemplateAndData={responseCallTemplate?.data} />
  );
};

export default CallTemplateFormPage;
