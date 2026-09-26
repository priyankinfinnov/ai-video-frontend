type UserType = {
  id?: number;
  _id?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phoneNumber?: string | null;
  isVerified?: boolean;
  isEnabled?: boolean;
  teamId?: number;
  teamName?: string;
  teamIds: string[];
  createdAt?: string;
  updatedAt?: string;
  emailIsVerifiedOn?: string;
};

export default UserType;
