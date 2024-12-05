class CourseRecommendation {
  final String title;
  final List<CourseItem> items;

  CourseRecommendation({required this.title, required this.items});

  @override
  String toString() {
    return 'CourseRecommendation{title: $title, items: $items}';
  }
}

class CourseItem {
  final String title;
  final String link;

  CourseItem({required this.title, required this.link});

  @override
  String toString() {
    return 'CourseItem{title: $title, link: $link}';
  }
}