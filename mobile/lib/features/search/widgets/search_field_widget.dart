import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../bloc/search_bloc.dart';

class SearchFieldWidget extends StatelessWidget {
  const SearchFieldWidget({super.key});

  final border = const OutlineInputBorder(
    borderRadius: BorderRadius.horizontal(
      left: Radius.circular(5),
    ),
  );

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Row(
        children: <Widget>[
          Expanded(
            child: TextField(
              decoration: InputDecoration(
                contentPadding: const EdgeInsets.all(10),
                hintText: 'Search',
                border: border,
                errorBorder: border,
                disabledBorder: border,
                focusedBorder: border,
                focusedErrorBorder: border,
              ),
              onChanged: (value) {
                context.read<SearchBloc>().add(SearchInputChanged(value));
              },
            ),
          ),
          Container(
            decoration: BoxDecoration(
              color: Colors.blue[800],
              borderRadius: const BorderRadius.only(
                topRight: Radius.circular(10),
              ),
            ),
            child: IconButton(
                icon: const Icon(
                  Icons.search,
                  color: Colors.white,
                ),
                onPressed: () async {
                  context.read<SearchBloc>().add(const FetchSearchResult());
                }),
          )
        ],
      ),
    );
  }
}
