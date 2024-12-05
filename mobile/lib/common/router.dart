import 'package:flutter/material.dart';
import 'package:frontend/common/screens/home_screen.dart';
import 'package:go_router/go_router.dart';

/* * * * * * * * * * * *
*
* /home
* /pages
*     /pages/1
*     /pages/2
*     ...
*     /pages/test
*
* * * * * * * * * * * */

const String homeRoute = '/home';
const String descriptionRoute = '/episodes';

final globalNavigationKey = GlobalKey<NavigatorState>(debugLabel: 'global');

//todo: disabled for MVP

final goRouter = GoRouter(
  navigatorKey: globalNavigationKey,
  initialLocation: homeRoute,
  routes: [
    GoRoute(
      path: homeRoute,
      pageBuilder: (context, state) => _TransitionPage(
        key: state.pageKey,
        child: const HomeScreen(),
      ),
    ),
  ],
);

class _TransitionPage extends CustomTransitionPage<dynamic> {
  _TransitionPage({super.key, required super.child})
      : super(
          transitionsBuilder: (
            context,
            animation,
            secondaryAnimation,
            child,
          ) =>
              FadeTransition(
            opacity: animation,
            child: child,
          ),
        );
}
