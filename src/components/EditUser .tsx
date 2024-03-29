import { Badge, Button, Card, TextInput, Title } from '@tremor/react';
import { useUserActions } from '../hooks/useUserActions';
import { useState } from 'react';

export function EditUser({ id, name, email, github }) {
  const { editUser } = useUserActions();
  const [result, setResult] = useState<'ok' | 'ko' | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setResult(null);

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const github = formData.get('github') as string;

    if(!name || !email || !github){
      return setResult('ko');
    }

    editUser({ id, name, email, github });
    setResult('ok');
    form.reset();
  }

  return (
    <Card style={{ marginTop: '16px'}}>
      <Title>Edit User</Title>
      <form className='' onSubmit={handleSubmit}>
        <TextInput name='name' placeholder='Type here your name' value={name} />
        <TextInput name='email' placeholder='Type here your email' value={email} />
        <TextInput name='github' placeholder='Type here your GitHub user' value={github} />
        <div>
          <Button 
            type='submit'
            style={{ marginTop: '16px'}}
             >
              Update User
             </Button>
             <span>
              { result === 'ko' && <Badge color='red'>Error! all fields are mandatory</Badge> }
             </span>
        </div>
      </form>
    </Card>
  )
}