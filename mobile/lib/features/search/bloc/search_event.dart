part of 'search_bloc.dart';

sealed class SearchEvent extends Equatable {
  const SearchEvent();
}

final class FetchSearchResult extends SearchEvent {


  const FetchSearchResult();

  @override
  List<Object> get props => [];
}

final class SearchInputChanged extends SearchEvent {
  final String query;

  const SearchInputChanged(this.query);

  @override
  List<Object> get props => [query];
}
