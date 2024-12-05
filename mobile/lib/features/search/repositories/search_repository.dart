import '../../../services/api_service.dart';

abstract class SearchRepository {
  final ApiService apiService;

  SearchRepository({required this.apiService});

  Future<String> fetchSearchResult(String query);
}

class SearchRepositoryImpl implements SearchRepository {
  @override
  final ApiService apiService;

  SearchRepositoryImpl({required this.apiService});

  @override
  Future<String> fetchSearchResult(String query) async {
    return await apiService.courseRecommendation(query: query);
  }
}
