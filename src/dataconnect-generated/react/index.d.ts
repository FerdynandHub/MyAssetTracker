import { CreatePublicListData, CreatePublicListVariables, GetPublicListsData, AddMovieToListData, AddMovieToListVariables, GetUserReviewsData, GetUserReviewsVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreatePublicList(options?: useDataConnectMutationOptions<CreatePublicListData, FirebaseError, CreatePublicListVariables>): UseDataConnectMutationResult<CreatePublicListData, CreatePublicListVariables>;
export function useCreatePublicList(dc: DataConnect, options?: useDataConnectMutationOptions<CreatePublicListData, FirebaseError, CreatePublicListVariables>): UseDataConnectMutationResult<CreatePublicListData, CreatePublicListVariables>;

export function useGetPublicLists(options?: useDataConnectQueryOptions<GetPublicListsData>): UseDataConnectQueryResult<GetPublicListsData, undefined>;
export function useGetPublicLists(dc: DataConnect, options?: useDataConnectQueryOptions<GetPublicListsData>): UseDataConnectQueryResult<GetPublicListsData, undefined>;

export function useAddMovieToList(options?: useDataConnectMutationOptions<AddMovieToListData, FirebaseError, AddMovieToListVariables>): UseDataConnectMutationResult<AddMovieToListData, AddMovieToListVariables>;
export function useAddMovieToList(dc: DataConnect, options?: useDataConnectMutationOptions<AddMovieToListData, FirebaseError, AddMovieToListVariables>): UseDataConnectMutationResult<AddMovieToListData, AddMovieToListVariables>;

export function useGetUserReviews(vars: GetUserReviewsVariables, options?: useDataConnectQueryOptions<GetUserReviewsData>): UseDataConnectQueryResult<GetUserReviewsData, GetUserReviewsVariables>;
export function useGetUserReviews(dc: DataConnect, vars: GetUserReviewsVariables, options?: useDataConnectQueryOptions<GetUserReviewsData>): UseDataConnectQueryResult<GetUserReviewsData, GetUserReviewsVariables>;
