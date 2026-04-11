pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "mobile-foundation-android"

include(":app")

// Future capability modules can be enabled here once they become real Android libraries.
// include(":core:runtime")
// include(":core:navigation")
// include(":core:designsystem")
// include(":core:networking")
// include(":core:storage")
// include(":core:permissions")
// include(":core:observability")
// include(":core:debug")
