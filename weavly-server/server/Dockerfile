# Stage 1: Build the application
FROM eclipse-temurin:17-jdk-jammy  AS build
WORKDIR /app
COPY . .
RUN ./mvnw clean package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:17-jdk-jammy
WORKDIR /app
# Copy the built jar from the build stage
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
# Change your existing entrypoint/cmd to include -Dserver.port=$PORT
ENTRYPOINT ["java", "-Dserver.port=${PORT}", "-jar", "app.jar"]