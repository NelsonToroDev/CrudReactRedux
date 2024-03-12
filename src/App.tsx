import { Toaster } from 'sonner';
import "./App.css";
import { CreateNewUser } from "./components/CreateNewUser";
import { ListOfUsers } from "./components/ListOfUsers";
// "$schema": "https://docs.rome.tools/schemas/12.1.3/schema.json",
function App () {

	return (
		<>
			<ListOfUsers />
			<CreateNewUser />
			<Toaster richColors />
		</>
	);
}

export default App;