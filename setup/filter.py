from collections import defaultdict

## DATASET GENERATION ##

def get_dataset(filename="../words/words_alpha.txt"):
  with open(filename, 'r') as f:
    dataset = {line.strip() for line in f}
  return dataset

def write_dataset(filename, dataset):
  with open(filename, 'w') as f:
    for word in sorted(dataset):
      f.write(f"{word}\n")
  print(f"Wrote {len(dataset)} to {filename}")

def filter_words(dataset):
  return set(filter(lambda s: len(s) >= 4, dataset))

## CPU LOGIC PLAYGROUND ##

def generate_map(substr, dataset):
  res = defaultdict(set)
  for word in dataset:
    if substr in word:
      res[len(word)].add(word)
  
  return res

def print_sorted(map):
  for k in sorted(map):
    print(k, sorted(map[k]))
  print()
  
## MAIN ##

if __name__ == "__main__":
  # Do the filtering and write to output
  output_file = "../words/words_filtered.txt"

  dataset = get_dataset("../words/words_alpha.txt")
  dataset = filter_words(dataset)
  write_dataset(output_file, dataset)

  # Get examples of maps
  map_ailm = generate_map("e", dataset)
  map_ailme = generate_map("ailme", dataset)
  map_tailm = generate_map("tailm", dataset)

  print_sorted(map_ailm)
  print_sorted(map_ailme)
  print_sorted(map_tailm)

  # Get length distribution
  lengths = {}
  for w in dataset:
    l = len(w)
    lengths[l] = lengths.get(l, 0) + 1
  print([(k, lengths[k]) for k in sorted(lengths)])

  tot = 0
  for k, v in lengths.items():
    tot += v * k * (k + 1) / 2
  
  print(tot)
  print(sum(lengths.values()))

