import {combineReducers} from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import apartmentReducer from './slices/apartmentSlice';
import borrowReducer from './slices/borrowSlice';
import issueReducer from './slices/issueSlice';
import paymentReducer from './slices/paymentSlice';
import notificationReducer from './slices/notificationSlice';
import assetReducer from './slices/assetSlice';
import utilityReducer from './slices/utilitySlice';

const appReducer = combineReducers({
  auth: authReducer,
  apartment: apartmentReducer,
  borrow: borrowReducer,
  issue: issueReducer,
  payment: paymentReducer,
  notification: notificationReducer,
  asset: assetReducer,
  utility: utilityReducer,
});

const rootReducer: typeof appReducer = (state, action) => {
  if (action.type === 'auth/signOutRequest') {
    return appReducer(undefined, action);
  }

  return appReducer(state, action);
};

export default rootReducer;
