# Proguard rules for ElectroAssistant SA
-keep class com.electroassistant.sa.** { *; }
-dontwarn com.electroassistant.sa.**

# Room Database Proguard Rules
-keep class androidx.room.** { *; }
-dontwarn androidx.room.**
-keep class * extends androidx.room.RoomDatabase
