import {
	QueryClient, QueryClientProvider
} from '@tanstack/react-query';
import { Toaster } from 'sonner';

import "./App.css";
import { ListOfUsers } from "./components/ListOfUsers";
// "$schema": "https://docs.rome.tools/schemas/12.1.3/schema.json",
function App () {
	const queryClient = new QueryClient();
	return (
		<QueryClientProvider client={queryClient}>
			<ListOfUsers />
			<Toaster richColors />
		</QueryClientProvider>
	);
}

export default App;