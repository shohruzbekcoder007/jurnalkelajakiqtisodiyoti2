import { Navigate, Route, Routes } from 'react-router-dom';

import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import SlugResolver from './pages/SlugResolver.jsx';
import { AuthorArchive, CategoryArchive, DateArchive } from './pages/Archive.jsx';
import NotFound from './pages/NotFound.jsx';

import AdminLayout from './pages/admin/AdminLayout.jsx';
import AdminLogin from './pages/admin/Login.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import PostsAdmin from './pages/admin/PostsAdmin.jsx';
import PostEdit from './pages/admin/PostEdit.jsx';
import PagesAdmin from './pages/admin/PagesAdmin.jsx';
import PageEdit from './pages/admin/PageEdit.jsx';
import CategoriesAdmin from './pages/admin/CategoriesAdmin.jsx';
import CommentsAdmin from './pages/admin/CommentsAdmin.jsx';
import SubmissionsAdmin from './pages/admin/SubmissionsAdmin.jsx';
import RequireAuth from './pages/admin/RequireAuth.jsx';

export default function App() {
  return (
    <Routes>
      {/* ------------------------------- admin ------------------------------- */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <RequireAuth>
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="posts" element={<PostsAdmin />} />
        <Route path="posts/new" element={<PostEdit />} />
        <Route path="posts/:id" element={<PostEdit />} />
        <Route path="pages" element={<PagesAdmin />} />
        <Route path="pages/new" element={<PageEdit />} />
        <Route path="pages/:id" element={<PageEdit />} />
        <Route path="categories" element={<CategoriesAdmin />} />
        <Route path="comments" element={<CommentsAdmin />} />
        <Route path="submissions" element={<SubmissionsAdmin />} />
      </Route>

      {/* ------------------------------ frontend ----------------------------- */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/page/:pageNum" element={<Home />} />

        <Route path="/category/:slug" element={<CategoryArchive />} />
        <Route path="/category/:slug/page/:pageNum" element={<CategoryArchive />} />

        <Route path="/author/:name" element={<AuthorArchive />} />
        <Route path="/author/:name/page/:pageNum" element={<AuthorArchive />} />

        <Route path="/:year/:month/:day/page/:pageNum" element={<DateArchive />} />
        <Route path="/:year/:month/:day" element={<DateArchive />} />
        <Route path="/:year/:month" element={<DateArchive />} />

        <Route path="/:slug" element={<SlugResolver />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="/wp-admin" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
