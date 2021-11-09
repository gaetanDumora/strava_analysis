library(dplyr)
library(factoextra)
library(ggpubr)

path <- "data/dist_by_week.csv"
df <- read.csv(path, header = TRUE, sep = ",")
df <- mutate_at(df, vars("id", "sex", "year", "week"), as.factor)
sc_df <- scale(df[, 5:ncol(df)])
print(head(sc_df, 10))

coude <- fviz_nbclust(sc_df, kmeans, method = "wss")
print(coude)

km <- kmeans(sc_df, 4, nstart = 25)
print(km)
k <- fviz_cluster(km, data = sc_df)

print(k)