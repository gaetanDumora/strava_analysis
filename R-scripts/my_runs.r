library(dplyr)

path <- "data/my_runs.csv"
df <- read.csv(path, header = TRUE, sep = ",")
df[df == "undefined" | is.na(df) | df == NULL | df == NaN] <- 0

df[, c("user_id", "sex")] <- lapply(df[, c("user_id", "sex")], as.character)
df$activity_date <- as.Date(df$activity_date)
df[, 6:ncol(df)] <- lapply(df[, 6:ncol(df)], as.numeric)


# coude <- factoextra::fviz_nbclust(df[, 6:ncol(df)], kmeans, method = "wss")
# print(coude)
# km <- kmeans(scale(df[, 6:ncol(df)]), centers = 7, nstart = 25)
# print(km)

# gkm <- factoextra::fviz_cluster(km, data = df[, 6:ncol(df)])
# print(gkm)

# print(summary(df))
# plot(df[, 6:ncol(df)])
year2021 <- filter(df, df$activity_date > "2021-01-01)")


plot(x = year2021$activity_date, y = year2021$std_speed, type = "h", col = "orange")

# # sc_df <- scale(df[, 6:ncol(df)])
# print(head(df, 10))
# plot(df)