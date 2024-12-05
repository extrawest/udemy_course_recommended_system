import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../cv_upload/cubit/file_uploader_cubit.dart';
import '../../search/widgets/search_field_widget.dart';
import '../../search/widgets/search_results_widget.dart';

class FileUploaderWidget extends StatelessWidget {
  const FileUploaderWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<FileUploaderCubit, FileUploaderState>(
      builder: (context, state) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Expanded(
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    if (state is FileUploaderLoading)
                      const Center(child: CircularProgressIndicator())
                    else if (state is FileUploaderSuccess) ...[
                      Card(
                        color: Colors.white,
                        child: Padding(
                          padding: const EdgeInsets.all(8.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _buildTitle(title: 'Level', text: state.cvDetails.level),
                              _buildTitle(title: 'Developer Role', text: state.cvDetails.role),
                              _buildTitle(title: 'SkillSet', text: state.cvDetails.skillset),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),
                      const SearchFieldWidget(),
                      const SizedBox(height: 20),
                      const SearchResultsWidget(),
                    ] else if (state is FileUploaderError)
                      Text('Error: ${state.message}'),
                    const SizedBox(height: 20),
                  ],
                ),
              ),
            ),
            Column(
              children: [
                if (state is FileUploaderSuccess) Text('File uploaded: ${state.fileName}'),
                const SizedBox(height: 10),
                ElevatedButton(
                  onPressed: () => context.read<FileUploaderCubit>().pickAndUploadFile(),
                  child: const Text('Pick and Upload File'),
                ),
                const SizedBox(height: 20),
              ],
            ),
          ],
        );
      },
    );
  }

  Widget _buildTitle({required final String title, required final String text}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: RichText(
        text: TextSpan(
          children: [
            TextSpan(text: '$title: ', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.black)),
            TextSpan(text: text, style: const TextStyle(color: Colors.black)),
          ],
        ),
      ),
    );
  }
}
