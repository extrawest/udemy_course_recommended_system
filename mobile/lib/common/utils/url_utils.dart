import 'dart:developer';

import 'package:url_launcher/url_launcher.dart';

void launchURL(String path) async {
  final Uri url = Uri.parse(path);

  if (await canLaunchUrl(url)) {
    await launchUrl(url);
  } else {
    throw 'Could not launch $url';
  }
}
