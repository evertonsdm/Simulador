# Protocolo de Expansão de Itens (RuleForge)

Sempre que um novo item (Profissão, Condição Visível ou Condição Não Visível) for solicitado, você DEVE garantir a integração completa em todos os módulos do sistema para que ele apareça corretamente em todos os menus (Catálogo, Sincronização, Gerador e Mapper).

## Checklist de Implementação Obrigatória:

1.  **`src/data/rulesRegistry.ts`**: Adicionar a entrada declarativa no nó correspondente (`profissoes`, `condicoesVisiveis`, ou `condicoesNaoVisiveis`).
    -   **Chave (ID)**: Deve ser o nome do item em minúsculas, sem espaços ou caracteres especiais (ex: `repositordesupermercado`).
    -   **Consistência**: Esta chave DEVE ser idêntica em todos os arquivos para garantir o funcionamento dos filtros e cálculos.

2.  **`src/rules/conditions.ts` (ou `src/rules/professions.ts` se existir)**: Adicionar o item à lógica do motor de geração.
    -   Certificar-se de que o nome (`name`) seja EXATAMENTE igual ao definido no registry.
    -   Garantir que ele esteja no nível de severidade/categoria correto.

3.  **`src/services/bodyPartMapping.ts`**: Se for uma **Condição Visível**, você DEVE adicionar o mapeamento de membros afetados (`CONDITION_TO_PARTS`). Sem isso, o item não aparecerá no **Condition Mapper** nem afetará o **BodyMap/Heatmap**.

4.  **Consistência de Nomes**: O campo `name` e a `chave` do objeto devem ser tratados como identificadores únicos. Nunca use variações de grafia entre arquivos.

5.  **Verificação de Visibilidade**: Após a criação, verifique mentalmente: "Este item está no Registry (para o Catálogo/Forge)? Está nas Rules (para o Gerador)? Se visível, está no BodyMapping (para o Mapa)?".
