import {
  type ActionFunctionArgs,
  type MetaFunction,
  redirect,
} from '@remix-run/node';
import { Outlet, useNavigate } from '@remix-run/react';
import { SearchContainer } from '~/components/search-container/search-container';

export const meta: MetaFunction = () => {
  return [
    { title: 'New Remix App' },
    { name: 'description', content: 'Welcome to Remix!' },
  ];
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const searchWord = formData.get('search');
  console.log('searchWord', searchWord);
  return redirect(`/test2`);
};

export default function Index() {
  const navigate = useNavigate();

  return (
    <>
      <SearchContainer />
      <ul>
        <li onClick={() => navigate('/list')}>List page</li>
        <li onClick={() => navigate('/test2')}>Go to test2</li>
      </ul>
      <Outlet />
    </>
  );
}
