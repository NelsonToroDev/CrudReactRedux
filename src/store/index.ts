import { Middleware, configureStore } from "@reduxjs/toolkit";
import { toast } from "sonner";
import usersReducer from "./users/slice";

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

	next(action);
	if (type === "users/deleteUserById") {
		fetch(`https://jsonplaceholder.typicode.com/users/${payload}`, { method: 'DELETE'})
			.then((res) => {
				if (res.ok) {
					toast.success(`User with id '${payload}' was deleted successful`);
				}
			})
			.catch(() => {
				console.log("Error!");
			});
	}

	if (type === "users/addNewUser") {
		fetch('https://jsonplaceholder.typicode.com/users', { method: 'POST'})
			.then((res) => {
				if (res.ok) {
					toast.success(`User '${name}' was created successful`);
				}
			})
			.catch(() => {
				console.log("Error!");
			});
	}
};

export const store = configureStore({
	reducer: {
		users: usersReducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware()
			.prepend(loggerMiddleware)
			.prepend(persistanceLocalStorageMiddleware)
			.prepend(syncWithMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
