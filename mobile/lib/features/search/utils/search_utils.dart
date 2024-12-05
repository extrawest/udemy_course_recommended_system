import '../models/course_recommendation_model.dart';

CourseRecommendation parseSearchResult(String result) {
  final lines = result.split('\n');
  final title = lines[0].trim();
  final items = <CourseItem>[];

  for (int i = 2; i < lines.length; i++) {
    final line = lines[i].trim();
    if (line.isNotEmpty) {
      final match = RegExp(r'\[(.*?)\]\((.*?)\)').firstMatch(line);
      if (match != null) {
        items.add(CourseItem(
          title: match.group(1)!,
          link: match.group(2)!,
        ));
      }
    }
  }

  return CourseRecommendation(title: title, items: items);
}