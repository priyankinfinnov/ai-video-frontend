import { SignupForm } from '@/components/auth';
import { Navbar } from '@/components/layout';
import { useNavigateIfRegistered } from '@/hooks';

const Signup = () => {
  useNavigateIfRegistered();

  return (
    <main>
      <Navbar />

      <div className='py-12 md:pt-24'>
        <SignupForm />
      </div>
    </main>
  );
};

export default Signup;
