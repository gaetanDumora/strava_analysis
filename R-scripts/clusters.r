library(dplyr)
library(factoextra)
library(ggpubr)

# path <- "data/dist_by_week.csv"
path <- "data/all_activities.csv"
df <- read.csv(path, header = TRUE, sep = ",")
# df <- mutate_at(df, vars("id", "sex", "year", "week"), as.factor)

df[df == "undefined" | is.na(df) | df == NULL | df == NaN] <- 0

df[, 1:5] <- lapply(df[, 1:5], as.factor)
df[, 6:ncol(df)] <- lapply(df[, 6:ncol(df)], as.numeric)
sc_df <- scale(df[, 6:ncol(df)])
# print(str(sc_df, 10))

coude <- fviz_nbclust(sc_df, kmeans, method = "wss")
print(coude)

km <- kmeans(sc_df, 5, nstart = 10)
print(km)
k <- fviz_cluster(km, data = sc_df)
# plot(df, col = km$centers)
print(k)