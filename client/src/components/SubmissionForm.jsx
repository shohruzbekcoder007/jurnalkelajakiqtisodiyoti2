import { useState } from 'react';
import { postSubmission } from '../api/client.js';
import { useSite } from '../context/SiteContext.jsx';

const EMPTY = {
  fullName: '',
  email: '',
  phone: '',
  workplace: '',
  degree: '',
  orcid: '',
  title: '',
  rubric: '',
  annotation: '',
  keywords: '',
  message: ''
};

// Fields follow "Maqola chop etish tartibi" — the requisites the journal asks
// every submitted article to carry.
export default function SubmissionForm() {
  const { categories } = useSite();
  const [form, setForm] = useState(EMPTY);
  const [state, setState] = useState({ sending: false, message: '', error: '' });

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setState({ sending: true, message: '', error: '' });
    try {
      const res = await postSubmission(form);
      setForm(EMPTY);
      setState({ sending: false, message: res.message, error: '' });
    } catch (err) {
      setState({
        sending: false,
        message: '',
        error: err.response?.data?.message || 'Ariza yuborilmadi'
      });
    }
  };

  return (
    <div className="themeform" id="maqola-yuborish-form">
      <h3 className="heading">Maqolangizni onlayn yuboring</h3>

      {state.message && <div className="hu-alert hu-alert-success">{state.message}</div>}
      {state.error && <div className="hu-alert hu-alert-error">{state.error}</div>}

      <form onSubmit={submit}>
        <div className="hu-form-row">
          <label htmlFor="s-fullName">
            Familiya, ism, otasining ismi <span className="required">*</span>
          </label>
          <input
            id="s-fullName"
            name="fullName"
            type="text"
            value={form.fullName}
            onChange={change}
            required
          />
        </div>

        <div className="hu-form-row">
          <label htmlFor="s-email">
            E-mail <span className="required">*</span>
          </label>
          <input id="s-email" name="email" type="email" value={form.email} onChange={change} required />
        </div>

        <div className="hu-form-row">
          <label htmlFor="s-phone">Telefon raqami</label>
          <input id="s-phone" name="phone" type="text" value={form.phone} onChange={change} />
        </div>

        <div className="hu-form-row">
          <label htmlFor="s-workplace">Ish joyi va lavozimi</label>
          <input
            id="s-workplace"
            name="workplace"
            type="text"
            value={form.workplace}
            onChange={change}
          />
        </div>

        <div className="hu-form-row">
          <label htmlFor="s-degree">Ilmiy darajasi, ilmiy unvoni</label>
          <input id="s-degree" name="degree" type="text" value={form.degree} onChange={change} />
        </div>

        <div className="hu-form-row">
          <label htmlFor="s-orcid">ORCID raqami</label>
          <input
            id="s-orcid"
            name="orcid"
            type="text"
            placeholder="ORCID:0000-0000-0000-0000"
            value={form.orcid}
            onChange={change}
          />
        </div>

        <div className="hu-form-row">
          <label htmlFor="s-title">
            Maqola sarlavhasi <span className="required">*</span>
          </label>
          <input id="s-title" name="title" type="text" value={form.title} onChange={change} required />
        </div>

        <div className="hu-form-row">
          <label htmlFor="s-rubric">Rukn</label>
          <select id="s-rubric" name="rubric" value={form.rubric} onChange={change}>
            <option value="">— tanlang —</option>
            {categories.map((c) => (
              <option key={c._id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="hu-form-row">
          <label htmlFor="s-annotation">Annotatsiya (40-45 ta soʻz)</label>
          <textarea
            id="s-annotation"
            name="annotation"
            rows="5"
            value={form.annotation}
            onChange={change}
          />
        </div>

        <div className="hu-form-row">
          <label htmlFor="s-keywords">Kalit soʻzlar (kamida 10 ta)</label>
          <textarea
            id="s-keywords"
            name="keywords"
            rows="3"
            value={form.keywords}
            onChange={change}
          />
        </div>

        <div className="hu-form-row">
          <label htmlFor="s-message">Tahririyatga xabar</label>
          <textarea id="s-message" name="message" rows="4" value={form.message} onChange={change} />
        </div>

        <input
          type="submit"
          value={state.sending ? 'Yuborilmoqda...' : 'Maqolani yuborish'}
          disabled={state.sending}
        />
        <p className="hu-form-note">
          Maqola fayli va 3&times;4 foto suratni tahririyatning telegram raqamiga yuboring:
          +998 90 031-59-91, +998 97 134-87-57
        </p>
      </form>
    </div>
  );
}
