import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import {
  createApartmentRequest,
  updateApartmentRequest,
  fetchApartmentRequest,
  fetchApartmentsRequest,
  selectApartmentRequest,
  joinApartmentRequest,
  fetchMembersRequest,
  removeMemberRequest,
  updateMemberRequest,
} from '../store/slices/apartmentSlice';

export function useApartment() {
  const dispatch = useAppDispatch();
  const { apartment, apartments, members, loading, error } = useAppSelector(
    state => state.apartment,
  );

  const createApartment = useCallback(
    (data: { name: string; address: string; num_rooms: number }) => {
      dispatch(createApartmentRequest(data));
    },
    [dispatch],
  );

  const fetchApartment = useCallback(
    (id: string) => {
      dispatch(fetchApartmentRequest({ id }));
    },
    [dispatch],
  );

  const updateApartment = useCallback(
    (
      id: string,
      updates: { name: string; address: string; num_rooms: number },
    ) => {
      dispatch(updateApartmentRequest({ id, updates }));
    },
    [dispatch],
  );

  const fetchApartments = useCallback(
    (userId: string, role: 'tenant' | 'landlord') => {
      dispatch(fetchApartmentsRequest({ userId, role }));
    },
    [dispatch],
  );

  const selectApartment = useCallback(
    (apartmentId: string) => {
      dispatch(selectApartmentRequest({ apartmentId }));
    },
    [dispatch],
  );

  const joinApartment = useCallback(
    (inviteCode: string) => {
      dispatch(joinApartmentRequest({ inviteCode }));
    },
    [dispatch],
  );

  const fetchMembers = useCallback(
    (apartmentId: string) => {
      dispatch(fetchMembersRequest({ apartmentId }));
    },
    [dispatch],
  );

  const removeMember = useCallback(
    (memberId: string) => {
      dispatch(removeMemberRequest({ memberId }));
    },
    [dispatch],
  );

  const updateMember = useCallback(
    (
      memberId: string,
      updates: { room_name?: string | null; rent_amount?: number },
    ) => {
      dispatch(updateMemberRequest({ memberId, updates }));
    },
    [dispatch],
  );

  return {
    apartment,
    apartments,
    members,
    loading,
    error,
    createApartment,
    updateApartment,
    fetchApartment,
    fetchApartments,
    selectApartment,
    joinApartment,
    fetchMembers,
    removeMember,
    updateMember,
  };
}
