// reducers/passwordReducer.js
import { SHOW_PASSWORD } from "../actions/types";

const initialState = {
  showPassword: false,
};

const passwordReducer = (state = initialState, action) => {
  switch (action.type) {
    case SHOW_PASSWORD:
      return {
        ...state,
        showPassword: !state.showPassword,
      };
    default:
      return state;
  }
};

export default passwordReducer;
