import React, { useState, useEffect, createContext, useContext } from 'https://unpkg.com/react@18/umd/react.development.js'
import ReactDOM from 'https://unpkg.com/react-dom@18/umd/react-dom.development.js'

const { createRoot } = ReactDOM

// Simple router using hash
function useRouter(){
  const [route, setRoute] = useState(window.location.hash.slice(1) || '/')
  useEffect(()=>{
    const onHash = () => setRoute(window.location.hash.slice(1) || '/')
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  },[])
  const push = (path) => { window.location.hash = path }
  return { route, push }
}

// DataContext
const DataContext = createContext(null)
const KEY = 'fittrack:data:v1'
function load(){ try{ return JSON.parse(localStorage.getItem(KEY) || '{}') }catch(e){ return {} } }
function save(d){ localStorage.setItem(KEY, JSON.stringify(d)) }

function DataProvider({ children }){
  const [state, setState] = useState(() => {
    const s = load()
    return { user: s.currentUser || null, activities: s.activities || [] }
  })

  useEffect(()=>{
    const toSave = { currentUser: state.user, activities: state.activities }
    save(toSave)
  }, [state])

  const signup = (email) => {
    const user = { id: 'u_' + Math.random().toString(36).slice(2,9), email }
    setState(s => ({ ...s, user }))
    return user
  }
  const login = (email) => signup(email)
  const logout = () => setState(s => ({ ...s, user: null }))

  const addActivity = (activity) => setState(s => ({ ...s, activities: [activity, ...s.activities] }))
  const deleteActivity = (id) => setState(s => ({ ...s, activities: s.activities.filter(a=>a.id!==id) }))

  return React.createElement(DataContext.Provider, { value: { ...state, signup, login, logout, addActivity, deleteActivity } }, children)
}
function useData(){ const ctx = useContext(DataContext); if(!ctx) throw new Error('useData must be used within DataProvider'); return ctx }

// Components
function Nav(){
  const { route, push } = useRouter()
  return (
    React.createElement('header', { className: 'site-nav' },
      React.createElement('div', { className: 'site-nav-inner' },
        React.createElement('a', { className: 'brand', href: '#/' , onClick: (e)=>{ e.preventDefault(); push('/') }}, 'FitTrack'),
        React.createElement('nav', { className: 'nav-links' },
          React.createElement('a', { className: 'nav-link', href: '#/', onClick: (e)=>{ e.preventDefault(); push('/') }}, 'Home'),
          React.createElement('a', { className: 'nav-link', href: '#/signup', onClick: (e)=>{ e.preventDefault(); push('/signup') }}, 'Sign Up'),
          React.createElement('a', { className: 'nav-link', href: '#/dashboard', onClick: (e)=>{ e.preventDefault(); push('/dashboard') }}, 'Dashboard')
        )
      )
    )
  )
}

function Home(){
  const { push } = useRouter()
  return (
    React.createElement('main', { className: 'app-root' },
      React.createElement('section', { className: 'hero card' },
        React.createElement('h1', { className: 'hero-title' }, 'FitTrack'),
        React.createElement('p', { className: 'hero-sub' }, 'Your lightweight workout and progress tracker'),
        React.createElement('p', { className: 'hero-text' }, 'Prototype frontend using components and in-browser temporary storage.'),
        React.createElement('div', { className: 'cta-group' },
          React.createElement('button', { className: 'btn btn-primary', onClick: ()=> push('/signup') }, 'Sign Up / Login'),
          React.createElement('button', { className: 'btn btn-outline', onClick: ()=> push('/dashboard') }, 'Open Dashboard')
        )
      )
    )
  )
}

function Auth(){
  const { signup, login, user } = useData()
  const { push } = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('')

  useEffect(()=>{ if(user) setStatus('Logged in as ' + user.email) }, [user])

  return (
    React.createElement('main', { className: 'app-root' },
      React.createElement('section', { className: 'card auth-card' },
        React.createElement('h1', { className: 'card-title' }, 'Sign Up / Login'),
        React.createElement('p', { className: 'card-sub' }, 'Create a demo account or log in (stored in your browser).'),
        React.createElement('div', { className: 'form' },
          React.createElement('label', { className: 'label' }, 'Email', React.createElement('input', { className: 'input', type: 'email', value: email, onInput: e=> setEmail(e.target.value) })),
          React.createElement('label', { className: 'label' }, 'Password', React.createElement('input', { className: 'input', type: 'password', value: password, onInput: e=> setPassword(e.target.value) })),
          React.createElement('div', { className: 'form-actions' },
            React.createElement('button', { className: 'btn btn-primary', onClick: ()=>{ if(!email||!password){ alert('Provide email and password'); return } signup(email); setStatus('Signed up and logged in as '+email); setTimeout(()=> push('/dashboard'),700) } }, 'Sign Up'),
            React.createElement('button', { className: 'btn btn-outline', onClick: ()=>{ if(!email||!password){ alert('Provide email and password'); return } login(email); setStatus('Logged in as '+email); setTimeout(()=> push('/dashboard'),700) } }, 'Login')
          ),
          React.createElement('p', { className: 'status-message muted' }, status)
        )
      )
    )
  )
}

function ActivityForm(){
  const { addActivity, user } = useData()
  const [type, setType] = useState('Course')
  const [date, setDate] = useState('')
  const [duration, setDuration] = useState('')
  const [distance, setDistance] = useState('')
  const [photoData, setPhotoData] = useState(null)

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if(!file) return
    const reader = new FileReader()
    reader.onload = () => setPhotoData(reader.result)
    reader.readAsDataURL(file)
  }

  const submit = (e) => {
    e.preventDefault()
    if(!date || !duration){ alert('Date and duration required'); return }
    if(!user){ alert('Please sign up or login'); return }
    const act = { id: 'a_'+Math.random().toString(36).slice(2,9), type, date, duration: Number(duration), distance: Number(distance||0), photo: photoData, owner: user.id, createdAt: new Date().toISOString() }
    addActivity(act)
    setType('Course'); setDate(''); setDuration(''); setDistance(''); setPhotoData(null)
  }

  return (
    React.createElement('form', { className: 'form', onSubmit: submit },
      React.createElement('label', { className: 'label' }, 'Type', React.createElement('select', { className: 'select', value: type, onChange: e=> setType(e.target.value) },
        React.createElement('option', null, 'Course'),
        React.createElement('option', null, 'Marche'),
        React.createElement('option', null, 'Vélo'),
        React.createElement('option', null, 'Natation'),
        React.createElement('option', null, 'Gym')
      )),
      React.createElement('label', { className: 'label' }, 'Date', React.createElement('input', { className: 'input', type: 'date', value: date, onChange: e=> setDate(e.target.value), required: true })),
      React.createElement('label', { className: 'label' }, 'Durée (minutes)', React.createElement('input', { className: 'input', type: 'number', min: 0, value: duration, onChange: e=> setDuration(e.target.value), required: true })),
      React.createElement('label', { className: 'label' }, 'Distance (km)', React.createElement('input', { className: 'input', type: 'number', step: '0.01', min: 0, value: distance, onChange: e=> setDistance(e.target.value) })),
      React.createElement('label', { className: 'label' }, 'Photo', React.createElement('input', { className: 'input', type: 'file', accept: 'image/*', onChange: handleFile })),
      React.createElement('div', { className: 'form-actions' }, React.createElement('button', { className: 'btn btn-primary', type: 'submit' }, 'Add'))
    )
  )
}

function ActivityList(){
  const { activities, deleteActivity, user } = useData()
  const list = activities.filter(a => !a.owner || (user && a.owner === user.id))
  if(!list || list.length === 0) return React.createElement('p', { className: 'muted' }, 'No activities yet.')

  return (
    React.createElement('ul', { className: 'activity-list' },
      list.map(a => React.createElement('li', { key: a.id, className: 'activity-item' },
        React.createElement('div', { className: 'activity-main' },
          React.createElement('div', null,
            React.createElement('div', { className: 'activity-type' }, a.type),
            React.createElement('div', { className: 'activity-meta' }, `${a.date} • ${a.duration} min • ${a.distance || 0} km`)
          ),
          React.createElement('div', { className: 'activity-actions' }, React.createElement('button', { className: 'btn btn-ghost', onClick: ()=> deleteActivity(a.id) }, 'Delete'))
        ),
        a.photo ? React.createElement('img', { className: 'activity-photo', src: a.photo, alt: 'activity' }) : null
      ))
    )
  )
}

function Dashboard(){
  const { user, logout } = useData()
  const { push } = useRouter()
  return (
    React.createElement('main', { className: 'app-root' },
      React.createElement('header', { className: 'dashboard-header card' },
        React.createElement('div', null, React.createElement('h2', { className: 'dashboard-title' }, 'Dashboard'), React.createElement('p', { className: 'dashboard-sub' }, 'Manage your activities (stored in your browser)')),
        React.createElement('div', { className: 'user-actions' },
          React.createElement('span', { className: 'user-email muted' }, user ? user.email : 'Guest'),
          React.createElement('button', { className: 'btn btn-outline', onClick: ()=> { logout(); push('/signup') } }, 'Logout')
        )
      ),
      React.createElement('section', { className: 'grid' },
        React.createElement('div', { className: 'panel card' }, React.createElement('h3', { className: 'panel-title' }, 'Add Activity'), React.createElement(ActivityForm, null)),
        React.createElement('div', { className: 'panel card' }, React.createElement('h3', { className: 'panel-title' }, 'Your Activities'), React.createElement(ActivityList, null))
      )
    )
  )
}

function App(){
  const { route } = useRouter()
  return (
    React.createElement(DataProvider, null,
      React.createElement(Nav, null),
      route === '/' && React.createElement(Home, null),
      route === '/signup' && React.createElement(Auth, null),
      route === '/dashboard' && React.createElement(Dashboard, null),
      React.createElement('footer', { className: 'app-footer' }, '© FitTrack')
    )
  )
}

const root = createRoot(document.getElementById('root'))
root.render(React.createElement(App))
