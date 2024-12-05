part of 'search_bloc.dart';

sealed class SearchState extends Equatable {
  final String query;

  const SearchState({required this.query});

  @override
  List<Object> get props => [query];
}

class SearchInitial extends SearchState {
  const SearchInitial() : super(query: '');
}

class SearchLoading extends SearchState {
  const SearchLoading({required super.query});
}

class SearchLoaded extends SearchState {
  final CourseRecommendation result;

  const SearchLoaded({required this.result, required super.query});

  @override
  List<Object> get props => [result, query];
}

class SearchError extends SearchState {
  final String message;

  const SearchError({required this.message, required super.query});

  @override
  List<Object> get props => [message, query];
}

class SearchInputChangedState extends SearchState {
  const SearchInputChangedState({required super.query});
}
