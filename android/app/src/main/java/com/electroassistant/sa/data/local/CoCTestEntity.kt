package com.electroassistant.sa.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Database
import androidx.room.RoomDatabase
import kotlinx.coroutines.flow.Flow

/**
 * Room Database Persistence for ElectroAssistant SA & HVAC Field Suite
 * Stores offline SANS 10142-1 inspection readings and digital job cards.
 */

@Entity(tableName = "coc_test_readings")
data class CoCTestEntity(
    @PrimaryKey val id: String,
    val certificateNumber: String,
    val circuitName: String,
    val breakerRatingA: Int,
    val earthContinuityOhms: Double,
    val insulationPnMOhm: Double,
    val insulationPeMOhm: Double,
    val insulationNeMOhm: Double,
    val tripCurrentMa: Double,
    val tripTimeMs: Double,
    val loopZsOhms: Double,
    val psccKa: Double,
    val touchVoltageV: Double,
    val breakingCapacityKa: Double,
    val timestampMillis: Long = System.currentTimeMillis()
)

@Dao
interface CoCTestDao {
    @Query("SELECT * FROM coc_test_readings ORDER BY timestampMillis DESC")
    fun getAllReadings(): Flow<List<CoCTestEntity>>

    @Query("SELECT * FROM coc_test_readings WHERE certificateNumber = :certNumber")
    fun getReadingsForCertificate(certNumber: String): Flow<List<CoCTestEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertReading(reading: CoCTestEntity)

    @Query("DELETE FROM coc_test_readings WHERE id = :id")
    suspend fun deleteReading(id: String)
}

@Database(entities = [CoCTestEntity::class], version = 1, exportSchema = false)
abstract class CoCDatabase : RoomDatabase() {
    abstract fun cocTestDao(): CoCTestDao
}
