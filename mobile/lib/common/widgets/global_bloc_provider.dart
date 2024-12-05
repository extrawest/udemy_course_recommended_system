import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../features/cv_upload/cubit/file_uploader_cubit.dart';
import '../../features/cv_upload/repositories/file_uploader_repository.dart';
import '../../features/search/bloc/search_bloc.dart';
import '../../features/search/repositories/search_repository.dart';

class GlobalBlocProvider extends StatelessWidget {
  const GlobalBlocProvider({
    super.key,
    required this.child,
  });

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider<SearchBloc>(
          create: (context) => SearchBloc(
            searchRepository: context.read<SearchRepository>(),
          ),
        ),
        BlocProvider<FileUploaderCubit>(
          create: (context) => FileUploaderCubit(
            fileUploaderRepository: context.read<FileUploaderRepository>(),
          ),
        ),
      ],
      child: child,
    );
  }
}
