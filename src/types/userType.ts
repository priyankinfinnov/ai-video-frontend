type UserType = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  teamIds: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  emailIsVerifiedOn: string;
};

export default UserType;
