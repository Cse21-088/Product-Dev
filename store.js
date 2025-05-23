// store.js
import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk"; // Import Redux Thunk middleware
import rootReducer from "./redux/reducers/index"; // Assuming your root reducer is in ./reducers/index.js

// Create the Redux store with middleware
const store = createStore(rootReducer, applyMiddleware(thunk));

export default store;