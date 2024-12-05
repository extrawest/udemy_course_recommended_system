import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../bloc/search_bloc.dart';

class SearchResultsWidget extends StatelessWidget {
  const SearchResultsWidget({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<SearchBloc, SearchState>(builder: (context, state) {
      if (state is SearchLoading) {
        return const Center(child: CircularProgressIndicator());
      } else if (state is SearchLoaded) {
        return Column(
          children: [
            Text(state.result.title),
            ...state.result.items.map((item) => Card(
              color: Colors.white,
              child: ListTile(
                title: Text(item.title),
                subtitle: Text(item.link),
              ),
            )),
          ],
        );
      } else {
        return const Text('Search for a course');
      }
    });
  }
}
