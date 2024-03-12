import { Middleware, configureStore } from "@reduxjs/toolkit";
import { toast } from "sonner";
import usersReducer, { rollbackUser } from "./users/slice";

const loggerMiddleware: Middleware = (store) => (next) => (action) => {
	console.log(store.getState());
	console.log(action);
	next(action);
	console.log(store.getState());
};

const persistanceLocalStorageMiddleware: Middleware =
	(store) => (next) => (action) => {
		next(action);
		localStorage.setItem("__redux__state__", JSON.stringify(store.getState()));
	};

const syncWithMiddleware: Middleware = (store) => (next) => (action) => {
	const { type, payload } = action;
	const { name } = payload;
	const previousState = store.getState();

	next(action);
	if (type === "users/deleteUserById") {
		const userToDelete = previousState.users.find(
			(user) => user.id === payload,
		);
		const { name: userToDeleteName } = userToDelete;

		fetch(`https://jsonplaceholder.typicode.com/users/${payload}`, {
			method: "DELETE",
		})
			.then((res) => {
				if (res.ok) {
					toast.success(`User '${userToDeleteName}' was deleted successful`);
				}
				else {
					throw new Error(`Error deleting the user '${userToDeleteName}`);
				}
			})
			.catch((err) => {
				// revert deleted user after optimistic UI
				toast.error(`Error deleting user '${userToDeleteName}'`);

				if (userToDelete) {
					store.dispatch(rollbackUser(userToDelete));
				}
				console.log(err);
			});
	}

	if (type === "users/addNewUser") {
		fetch("https://jsonplaceholder.typicode.com/users", { method: "POST" })
			.then((res) => {
				if (res.ok) {
					toast.success(`User '${name}' was created successful`);
				} else {
					throw new Error("Error creating a new user");
				}
			})
			.catch((err) => {
				console.log(err);
			});
	}
};

export const store = configureStore({
	reducer: {
		users: usersReducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware()
			.prepend(persistanceLocalStorageMiddleware)
			.prepend(syncWithMiddleware),
	//.prepend(loggerMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
