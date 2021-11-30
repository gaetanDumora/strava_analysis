library("dplyr")
library("ggplot2")
library("factoextra")

path <- "data/my_runs.csv"
df <- read.csv(path, header = TRUE, sep = ",")
df[df == "undefined" | is.na(df) | df == NULL | df == NaN] <- 0

df[, c("user_id", "sex")] <- lapply(df[, c("user_id", "sex")], as.character)
df$activity_date <- as.Date(df$activity_date)
df[, 6:ncol(df)] <- lapply(df[, 6:ncol(df)], as.numeric)

# Clusters
coude <- fviz_nbclust(df[, 6:ncol(df)], kmeans, method = "wss")
print(coude)
km <- kmeans(scale(df[, 6:ncol(df)]), centers = 3)
print(km)

gkm <- fviz_cluster(km, data = df[, 6:ncol(df)])
print(gkm)

# print(summary(df))
# plot(df[, 6:ncol(df)])
year2021 <- filter(df, df$activity_date > "2021-01-01)")
print(summary(year2021))
# print(summary(year2021))
# plot(year2021[,-1])

print(
    ggplot(year2021) +
    geom_point(aes(x = calories, y = std_speed), color = "darkgreen", size = 3, alpha = 0.3)
    )
# print(plot(x = year2021$activity_date, y = year2021$std_speed, type = "h", col = "orange"))

# # sc_df <- scale(df[, 6:ncol(df)])
# print(head(df, 10))
# plot(df)