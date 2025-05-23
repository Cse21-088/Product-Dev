import {
  REGISTER_USER_REQUEST,
  REGISTER_USER_SUCCESS,
  REGISTER_USER_FAILURE,
  REGISTER_ADMIN_REQUEST,
  REGISTER_ADMIN_SUCCESS,
  REGISTER_ADMIN_FAILURE,
} from "../actions/authActions";

const initialState = {
  loading: false,
  error: null,
  success: false,
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case REGISTER_USER_REQUEST:
      return { ...state, loading: true, error: null, success: false };
    case REGISTER_USER_SUCCESS:
      return { ...state, loading: false, error: null, success: true };
    case REGISTER_USER_FAILURE:
      return { ...state, loading: false, error: action.error, success: false };
    case REGISTER_ADMIN_REQUEST:
      return { ...state, loading: true, error: null, success: false };
    case REGISTER_ADMIN_SUCCESS:
      return { ...state, loading: false, error: null, success: true };
    case REGISTER_ADMIN_FAILURE:
      return { ...state, loading: false, error: action.error, success: false };
    default:
      return state;
  }
};

export default authReducer;