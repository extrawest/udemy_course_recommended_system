part of 'file_uploader_cubit.dart';

abstract class FileUploaderState {}

class FileUploaderInitial extends FileUploaderState {}

class FileUploaderLoading extends FileUploaderState {}

class FileUploaderSuccess extends FileUploaderState {
  final String fileName;
  final CVDetails cvDetails;

  FileUploaderSuccess({
    required this.fileName,
    required this.cvDetails
  });
}

class FileUploaderError extends FileUploaderState {
  final String message;

  FileUploaderError(this.message);
}