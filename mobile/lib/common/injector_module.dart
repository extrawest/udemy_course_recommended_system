import 'package:get_it/get_it.dart';

import '../services/api_service.dart';

class InjectorModule {
  static GetIt locator = GetIt.asNewInstance();

  static Future<void> inject() async {
    GetIt.I.registerLazySingleton<ApiService>(() => ApiService());
  }
}
