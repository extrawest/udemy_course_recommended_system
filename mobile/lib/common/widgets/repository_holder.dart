import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:get_it/get_it.dart';

import '../../features/cv_upload/repositories/file_uploader_repository.dart';
import '../../features/search/repositories/search_repository.dart';
import '../../services/api_service.dart';

class RepositoriesHolder extends StatelessWidget {
  final Widget child;

  const RepositoriesHolder({
    super.key,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    final ApiService apiService = GetIt.I<ApiService>();

    return MultiRepositoryProvider(
      providers: [
        RepositoryProvider<SearchRepository>(
          create: (context) => SearchRepositoryImpl(
            apiService: apiService,
          ),
        ),
        RepositoryProvider<FileUploaderRepository>(
          create: (context) => FileUploaderRepositoryImpl(
            apiService: apiService,
          ),
        ),
      ],
      child: child,
    );
  }
}
