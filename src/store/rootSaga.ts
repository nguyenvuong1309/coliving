import {all, fork} from 'redux-saga/effects';
import {authSaga} from './slices/authSlice';
import {apartmentSaga} from './slices/apartmentSlice';
import {borrowSaga} from './slices/borrowSlice';
import {issueSaga} from './slices/issueSlice';
import {paymentSaga} from './slices/paymentSlice';
import {notificationSaga} from './slices/notificationSlice';
import {assetSaga} from './slices/assetSlice';
import {utilitySaga} from './slices/utilitySlice';
import {expenseSaga} from './slices/expenseSlice';
import {chatSaga} from './slices/chatSlice';
import {choreSaga} from './slices/choreSlice';

export default function* rootSaga() {
  yield all([
    fork(authSaga),
    fork(apartmentSaga),
    fork(borrowSaga),
    fork(issueSaga),
    fork(paymentSaga),
    fork(notificationSaga),
    fork(assetSaga),
    fork(utilitySaga),
    fork(expenseSaga),
    fork(chatSaga),
    fork(choreSaga),
  ]);
}
