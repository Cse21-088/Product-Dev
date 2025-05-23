// reducers/index.js
import { combineReducers } from "redux";
import passwordReducer from "./passwordReducer";

const rootReducer = combineReducers({
  password: passwordReducer,
});

export default rootReducer;