import {useCallback} from 'react';
import {useAppDispatch, useAppSelector} from '../store';
import {
  createApartmentRequest,
  fetchApartmentRequest,
  joinApartmentRequest,
  fetchMembersRequest,
  removeMemberRequest,
} from '../store/slices/apartmentSlice';

export function useApartment() {
  const dispatch = useAppDispatch();
  const {apartment, members, loading, error} = useAppSelector(
    state => state.apartment,
  );

  const createApartment = useCallback(
    (data: {name: string; address: string; num_rooms: number}) => {
      dispatch(createApartmentRequest(data));
    },
    [dispatch],
  );

  const fetchApartment = useCallback(
    (id: string) => {
      dispatch(fetchApartmentRequest({id}));
    },
    [dispatch],
  );

  const joinApartment = useCallback(
    (inviteCode: string) => {
      dispatch(joinApartmentRequest({inviteCode}));
    },
    [dispatch],
  );

  const fetchMembers = useCallback(
    (apartmentId: string) => {
      dispatch(fetchMembersRequest({apartmentId}));
    },
    [dispatch],
  );

  const removeMember = useCallback(
    (memberId: string) => {
      dispatch(removeMemberRequest({memberId}));
    },
    [dispatch],
  );

  return {
    apartment,
    members,
    loading,
    error,
    createApartment,
    fetchApartment,
    joinApartment,
    fetchMembers,
    removeMember,
  };
}
