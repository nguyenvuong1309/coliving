import {useEffect} from 'react';
import {supabase} from '../config/supabase';
import {useAppDispatch, useAppSelector} from '../store';
import {fetchBorrowRequestsRequest} from '../store/slices/borrowSlice';
import {fetchIssuesRequest} from '../store/slices/issueSlice';
import {fetchMyPaymentsRequest} from '../store/slices/paymentSlice';
import {addNotification} from '../store/slices/notificationSlice';

export function useRealtime(apartmentId: string | undefined) {
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);

  useEffect(() => {
    if (!apartmentId) {
      return;
    }

    const borrowChannel = supabase
      .channel(`borrow:${apartmentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'borrow_requests',
          filter: `apartment_id=eq.${apartmentId}`,
        },
        () => {
          dispatch(fetchBorrowRequestsRequest({apartmentId}));
        },
      )
      .subscribe();

    const issueChannel = supabase
      .channel(`issues:${apartmentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'issues',
          filter: `apartment_id=eq.${apartmentId}`,
        },
        () => {
          dispatch(fetchIssuesRequest({apartmentId}));
        },
      )
      .subscribe();

    const paymentChannel = supabase
      .channel(`payments:${apartmentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
        },
        () => {
          if (user) {
            dispatch(fetchMyPaymentsRequest({userId: user.id}));
          }
        },
      )
      .subscribe();

    const notificationChannel = supabase
      .channel(`notifications:${user?.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user?.id}`,
        },
        payload => {
          dispatch(addNotification(payload.new as any));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(borrowChannel);
      supabase.removeChannel(issueChannel);
      supabase.removeChannel(paymentChannel);
      supabase.removeChannel(notificationChannel);
    };
  }, [apartmentId, user, dispatch]);
}
