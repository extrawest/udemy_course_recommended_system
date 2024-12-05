import 'dart:developer';
import 'dart:io';

import 'package:file_picker/file_picker.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../common/network/exceptions/api_exceptions.dart';
import '../models/sv_details.dart';
import '../repositories/file_uploader_repository.dart';

part 'file_uploader_state.dart';

class FileUploaderCubit extends Cubit<FileUploaderState> {
  final FileUploaderRepository fileUploaderRepository;

  FileUploaderCubit({required this.fileUploaderRepository}) : super(FileUploaderInitial());

  Future<void> uploadFile(File file) async {
    emit(FileUploaderLoading());

    try {
      final result = await fileUploaderRepository.sendFile(file);
      CVDetails cvDetails = CVDetails.fromString(result);
      emit(FileUploaderSuccess(fileName: file.path.split('/').last, cvDetails: cvDetails));
    } on ApiException catch (e) {
      if (e.statusCode != null) {
        log('Status Code: ${e.statusCode}');
      }
      emit(FileUploaderError(e.message));
    } catch (e) {
      log('Unexpected error: $e');
      emit(FileUploaderError(e.toString()));
    }
  }

  Future<void> pickAndUploadFile() async {
    try {
      FilePickerResult? result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['pdf', 'docx', 'csv'],
      );

      if (result != null) {
        File file = File(result.files.single.path!);
        await uploadFile(file);
      } else {
        // User canceled the picker
        emit(FileUploaderInitial());
      }
    } catch (e) {
      log('Error picking or uploading file: $e');
      emit(FileUploaderError(e.toString()));
    }
  }
}
