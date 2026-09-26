import { LoginForm } from '@/components/auth';
import { Navbar } from '@/components/layout';
import { useNavigateIfRegistered } from '@/hooks';

const Login = () => {
  useNavigateIfRegistered();

  return (
    <main>
      <Navbar />

      {/* <div className='py-12 px-4 md:pt-24'></div> */}
      <div className='py-12 md:pt-24'>
        <LoginForm />
      </div>
    </main>
  );
};

export default Login;
