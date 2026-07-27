import { redirect } from 'next/navigation';

export default function NvRootPage() {
  // Redirect the root of the NV portal to its dashboard
  redirect('/nv/dashboard');
}
