import 'package:flutter/material.dart';

import '../widgets/search_field_widget.dart';
import '../widgets/search_results_widget.dart';

class SearchScreen extends StatelessWidget {
  const SearchScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Museum Screen'),
      ),
      body: const Padding(
        padding: EdgeInsets.all(8.0),
        child: Column(
          children: [
            SearchFieldWidget(),
            SizedBox(height: 20),
            SearchResultsWidget(),
          ],
        ),
      ),
    );
  }
}
