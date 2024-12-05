import 'package:flutter/material.dart';

import '../widgets/file_upload_widget.dart';

class UploadScreen extends StatelessWidget {
  const UploadScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Upload CV'),
        ),
        body: const Padding(
          padding: EdgeInsets.all(8.0),
          child: FileUploaderWidget(),
        ),
      ),
    );
  }
}
