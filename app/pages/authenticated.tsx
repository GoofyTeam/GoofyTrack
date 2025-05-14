import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';

export default function ProtectedPage() {
  return (
    <div>
      <h1>Authenticated Page</h1>
      <p>You are authenticated and can view this page.</p>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};
