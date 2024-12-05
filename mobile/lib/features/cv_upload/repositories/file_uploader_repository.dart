
import 'dart:io';

import '../../../services/api_service.dart';

abstract class FileUploaderRepository {
  final ApiService apiService;

  FileUploaderRepository(this.apiService);

  Future<String> sendFile(File file);
}

class FileUploaderRepositoryImpl implements FileUploaderRepository {
  @override
  final ApiService apiService;

  FileUploaderRepositoryImpl({required this.apiService});

  @override
  Future<String> sendFile(File file) async {
    return await apiService.uploadFile(file);
  }
}
